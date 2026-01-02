import './server/index.js';
process.on('uncaughtException', (err) => {
    console.error('CRASH DETECTED:');
    console.error(err.stack);
    process.exit(1);
});
process.on('unhandleRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:');
    console.error(reason);
    process.exit(1);
});
