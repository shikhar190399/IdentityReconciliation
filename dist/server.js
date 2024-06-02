import express from 'express';
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    res.send("Hello from World");
});
app.listen(port, () => {
    console.log(`connect to server on port on ${port}`);
});
