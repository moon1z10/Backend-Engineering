const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('protos/calculator.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const calculatorProto = grpc.loadPackageDefinition(packageDefinition).calculator;

// gRPC 서버 구현
function add(call, callback) {
    const num1 = call.request.num1;
    const num2 = call.request.num2;
    const result = num1 + num2;
    callback(null, { result });
}

function main() {
    const server = new grpc.Server();
    server.addService(calculatorProto.Calculator.service, { add: add });
    server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.error(`Server binding error: ${error.message}`);
            return;
        }
        console.log(`gRPC server running on http://127.0.0.1:${port}`);
    });
}

main();
