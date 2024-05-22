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

function main() {
    const client = new calculatorProto.Calculator('localhost:50051', grpc.credentials.createInsecure());

    const num1 = 3;
    const num2 = 5;

    client.add({ num1, num2 }, (error, response) => {
        if (!error) {
            console.log(`Addition result: ${response.result}`);
        } else {
            console.error(error);
        }
    });
}

main();
