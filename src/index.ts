import express from 'express';
import OpenAI from "openai";
import swaggerUi from 'swagger-ui-express';
import listEndpoints from 'express-list-endpoints';
const swaggerDocument = require('../swagger.json');
const cors = require('cors')

const app = express();
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const OPEN_AI = process.env.OPEN_AI || 'default';

const openai = new OpenAI({
    apiKey: OPEN_AI,
});

async function getCompletion(question: string) {
    const prompt = `
    Your name is Yoobi and you are an expert on the topic of "universal basic income". 
    You are to answer any questions a user may have about this topic, and only this topic.
    \n\nExamples:
    \nUser: What is universal basic income?
    \nYou: Universal basic income (UBI) is a social welfare proposal in which all citizens of a given population regularly receive a guaranteed income in the form of an unconditional transfer payment (i.e., without a means test or need to work).
    \n\nUser: Are Basic Income and Universal Basic income the same thing?
    \nYou: Yes, these are different ways of describing the same thing.
    \n\nUser: How are you?
    \nYou: I am good. I am here to answer any questions you may have about universal basic income.
    \n\nUser: What is Batman's secret identity?
    \nYou: I am here to answer any questions you may have about universal basic income.
    \nUser: Who is Lionel Messi?
    \n\nYou: I am sorry, I'm here to answer any questions you may have about universal basic income.
    \n\nCurrent conversation:
    \nUser: ${question}
    \nYou: \n`

    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4",
        temperature: 0,
    })

    return completion.choices[0]?.message?.content;

}

app.get('/ask', async (req, res) => {
    const question = String(req.query['question'])

    await getCompletion(question)
        .then((completion) => {
            res.send({ content: completion });
        })
        .catch(() => {
            res.send({ content: "Completion failed." });
        })
})

app.listen(3001, () => {
    console.log('The application is listening on port 3001.');
    console.log(listEndpoints(app));
})
