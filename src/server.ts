import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import router from './router/routes';
import { connect } from './database/connect';

const NAMESPACE = 'SERVER CONNECTION'
const app = express();
const port = process.env.PORT;


app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(cors({origin: '*', methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH', 'OPTIONS'] }));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({message: err.message});
} )


app.use('/app', router)

app.get('/', (req,res) => {
    res.send("Hello from World");
})

app.listen(port, () => {
    console.info(`connect to server on port on ${port}`);
    connect();
})
