const modbus = require('jsmodbus');
const net = require('net');

class ModbusTCPServer {
  constructor(port) {
    this.port = port;
    this.holdingRegisters = [0, 0, 0, 0];
    this.server = null;
  }

  start() {
    this.server = new net.Server();
    const modbusServer = new modbus.server.TCP(this.server);

    // Custom function to handle reading holding registers
    modbusServer.on('readHoldingRegisters', (request) => {
      const startAddress = request.address;
      const quantity = request.quantity;
      const data = this.holdingRegisters.slice(
        startAddress,
        startAddress + quantity
      );
    });

    // Custom function to handle writing holding registers
    modbusServer.on('writeMultipleRegisters', (request) => {
      const startAddress = request.address;
      const data = request.values;

      // Update the simulated data with the received values
      for (let i = 0; i < data.length; i++) {
        this.holdingRegisters[startAddress + i] = data[i];
      }

      // Respond with the updated data
      // response(data);

      // Log the data change
      console.log(`Data written to holding registers: [${data}]`);
    });

    this.server.listen(this.port, () => {
      console.log(`Modbus TCP server is listening on port ${this.port} `);
    });

    // Handle server connection event
    this.server.on('connection', (socket) => {
      console.log(
        'New client connected!',
        socket.localAddress,
        socket.localPort,
        socket.remotePort,
        modbusServer.input
      );
    });

    // Handle server close event
    this.server.on('close', () => {
      console.log('Modbus TCP server is closed');
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('Modbus TCP server is stopped');
    }
  }
}

const serverPort = 502; // Modbus TCP default port
const modbusTCPServer = new ModbusTCPServer(serverPort);
modbusTCPServer.start();
