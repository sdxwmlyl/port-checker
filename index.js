const net = require('net');
const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

/**
 * Check if a port is occupied
 * @param {number} port
 * @returns {Promise<boolean>}
 */
async function isPortOccupied(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close(() => resolve(false));
    });
    
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Get process info by port
 * @param {number} port
 * @returns {Promise<Object|null>}
 */
async function getProcessByPort(port) {
  const platform = os.platform();
  
  try {
    if (platform === 'linux') {
      return await getProcessLinux(port);
    } else if (platform === 'darwin') {
      return await getProcessMacOS(port);
    } else if (platform === 'win32') {
      return await getProcessWindows(port);
    }
  } catch (err) {
    // Fallback: try to return at least that port is occupied
    const occupied = await isPortOccupied(port);
    if (occupied) {
      return { port, pid: null, name: 'unknown', path: 'unknown', status: 'occupied' };
    }
  }
  
  return null;
}

async function getProcessLinux(port) {
  // Try ss first, then netstat
  const commands = [
    `ss -tlnp | grep ':${port} '`,
    `netstat -tlnp 2>/dev/null | grep ':${port} '`,
    `lsof -i :${port} -sTCP:LISTEN -n -P`
  ];
  
  for (const cmd of commands) {
    try {
      const { stdout } = await execAsync(cmd);
      if (stdout) {
        return parseLinuxOutput(stdout, port);
      }
    } catch (e) {
      // Try next command
    }
  }
  
  return null;
}

function parseLinuxOutput(output, port) {
  const lines = output.trim().split('\n');
  
  for (const line of lines) {
    // ss format: LISTEN 0  511  *:3000  *:*  users:(("node",pid=1234,fd=12))
    // netstat format: tcp  0  0 0.0.0.0:3000  0.0.0.0:*  LISTEN  1234/node
    // lsof format: node  1234  user  20u  IPv4  12345  0t0  TCP *:3000 (LISTEN)
    
    let pid = null;
    let name = null;
    
    // Try ss format
    const ssMatch = line.match(/pid=(\d+)/);
    if (ssMatch) {
      pid = parseInt(ssMatch[1]);
      const nameMatch = line.match(/\("([^"]+)"/);
      name = nameMatch ? nameMatch[1] : 'unknown';
    }
    
    // Try netstat format
    if (!pid) {
      const netstatMatch = line.match(/\s+(\d+)\/([^\s]+)/);
      if (netstatMatch) {
        pid = parseInt(netstatMatch[1]);
        name = netstatMatch[2];
      }
    }
    
    // Try lsof format
    if (!pid) {
      const lsofMatch = line.match(/^\S+\s+(\d+)\s+\S+\s+\d+u\s+IPv/);
      if (lsofMatch) {
        pid = parseInt(lsofMatch[1]);
        name = line.trim().split(/\s+/)[0];
      }
    }
    
    if (pid) {
      return { port, pid, name, path: getProcessPath(pid), status: 'occupied' };
    }
  }
  
  return { port, pid: null, name: 'unknown', path: 'unknown', status: 'occupied' };
}

async function getProcessMacOS(port) {
  try {
    const { stdout } = await execAsync(`lsof -iTCP:${port} -sTCP:LISTEN -n -P`);
    if (stdout) {
      const lines = stdout.trim().split('\n').slice(1); // Skip header
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          const name = parts[0];
          const pid = parseInt(parts[1]);
          return { port, pid, name, path: getProcessPath(pid), status: 'occupied' };
        }
      }
    }
  } catch (e) {
    // Command failed
  }
  
  return null;
}

async function getProcessWindows(port) {
  try {
    // Get PID from netstat
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    if (stdout) {
      const lines = stdout.trim().split('\n');
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const localAddr = parts[1];
          if (localAddr.includes(`:${port}`)) {
            const pid = parseInt(parts[4]);
            
            // Get process name from tasklist
            try {
              const { stdout: tasklist } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
              const match = tasklist.match(/"([^"]+)"/);
              const name = match ? match[1] : 'unknown';
              return { port, pid, name, path: getProcessPath(pid), status: 'occupied' };
            } catch (e) {
              return { port, pid, name: 'unknown', path: 'unknown', status: 'occupied' };
            }
          }
        }
      }
    }
  } catch (e) {
    // Command failed
  }
  
  return null;
}

function getProcessPath(pid) {
  // This is platform-specific and may require elevated permissions
  // For now, return a placeholder
  return pid ? `[PID: ${pid}]` : 'unknown';
}

/**
 * Check multiple ports
 * @param {number[]} ports
 * @returns {Promise<Object[]>}
 */
async function checkPorts(ports) {
  const results = [];
  
  for (const port of ports) {
    const info = await getProcessByPort(port);
    if (info) {
      results.push(info);
    } else {
      results.push({ port, pid: null, name: '-', path: '-', status: 'free' });
    }
  }
  
  return results;
}

module.exports = {
  isPortOccupied,
  getProcessByPort,
  checkPorts
};
