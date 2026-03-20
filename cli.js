#!/usr/bin/env node

const { checkPorts } = require('./index.js');

function printUsage() {
  console.log(`
Usage: port-check <port> [port2] [port3] ...

Check which processes are using specific ports.

Examples:
  port-check 3000           Check port 3000
  port-check 3000 8080      Check ports 3000 and 8080
  port-check 3000 8080 9000 Check multiple ports

Output columns:
  PORT    - Port number
  STATUS  - occupied or free
  PID     - Process ID (if occupied)
  NAME    - Process name (if occupied)
`);
}

function formatTable(results) {
  // Calculate column widths
  const portWidth = Math.max(6, ...results.map(r => String(r.port).length));
  const statusWidth = 10;
  const pidWidth = Math.max(6, ...results.map(r => r.pid ? String(r.pid).length : 1));
  const nameWidth = Math.max(10, ...results.map(r => r.name.length));
  
  // Header
  const header = ` ${'PORT'.padEnd(portWidth)} │ ${'STATUS'.padEnd(statusWidth)} │ ${'PID'.padEnd(pidWidth)} │ ${'NAME'.padEnd(nameWidth)} `;
  const separator = '─'.repeat(header.length);
  
  // Rows
  const rows = results.map(r => {
    const status = r.status === 'occupied' ? '🔴 occupied' : '🟢 free';
    const pid = r.pid || '-';
    return ` ${String(r.port).padEnd(portWidth)} │ ${status.padEnd(statusWidth)} │ ${String(pid).padEnd(pidWidth)} │ ${r.name.padEnd(nameWidth)} `;
  });
  
  return [separator, header, separator, ...rows, separator].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }
  
  // Parse port numbers
  const ports = args.map(arg => {
    const port = parseInt(arg, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error(`Error: "${arg}" is not a valid port number (1-65535)`);
      process.exit(1);
    }
    return port;
  });
  
  console.log(`\nChecking ${ports.length} port(s)...\n`);
  
  try {
    const results = await checkPorts(ports);
    console.log(formatTable(results));
    
    // Summary
    const occupied = results.filter(r => r.status === 'occupied').length;
    const free = results.filter(r => r.status === 'free').length;
    
    console.log(`\nSummary: ${occupied} occupied, ${free} free\n`);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
