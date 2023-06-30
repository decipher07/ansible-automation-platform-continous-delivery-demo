import express, { Response, Request, NextFunction, Express } from "express";
import { QueryResult } from "pg";
import { config } from './config/config';
import client from "./database/connect";

/** Connect ot the Database */
client.connect((err) => {
    if (err)
        throw err;

    console.log("Database Connected");
});

const app: Express = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** Rules of our API */
app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/** Log the request */
app.use((req: Request, res: Response, next: NextFunction) => {
    /** Log the req */
    console.log(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        console.log(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
    });

    next();
});

app.get('/ping', async (req: Request, res: Response, next: NextFunction) => res.status(200).json({ "Hello": "World" }));

app.post('/save-score', async (req: Request, res: Response, next: NextFunction) => {
    const { score, isCompleted } = req.body;

    const query = "INSERT INTO score_card (score,is_completed) VALUES($1,$2) RETURNING *";
    const values = [score, isCompleted];

    try {
        let createQueryExecutionResult: QueryResult = await client.query(query, values);
        return res.status(200).json({ "success": true, "data": createQueryExecutionResult.rows, "message": null });
    } catch (err: any) {
        console.error(err.message);
        return res.status(404).json({ "success": false, "data": null, "message": "Error in posting data to the Database" });
    }
})

app.get('/high-score', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = "SELECT score FROM score_card WHERE is_completed = true ORDER BY score ASC LIMIT 1";
        const result = await client.query(query);

        if (result.rows.length > 0) {
            const leastScore = result.rows[0].score;
            return res.status(200).json({ success: true, leastScore });
        } else {
            return res.status(200).json({ success: true, leastScore: null });
        }
    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ success: false, error: "Error in fetching data from the database" });
    }
});

/** Error handling */
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error('Not found');
    console.error(error.message);

    res.status(404).json({
        message: error.message
    });
});

/** Listening on port */
app.listen(config.server.port, (): void => console.info(`Server is running on port ${config.server.port}`))