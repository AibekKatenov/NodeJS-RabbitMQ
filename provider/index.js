const express = require("express");
const axios = require("axios");
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(express.urlencoded())

const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: '/app/logs/app.log' })
    ]
});

const amqp = require("amqplib");
let channel, connection;
const tasksQueue = 'tasksQueue';
const resultsQueue = 'resultsQueue';

async function connectQueue() {
    try {

        connection = await amqp.connect("amqp://rabbitmq:5672");
        channel = await connection.createChannel()

        await channel.assertQueue(tasksQueue)

    } catch (error) {
        logger.error(`Ошибка при создании канала или подключения к RabbitMQ provider: ${error.message}`);
    }
}

async function listenForResults() {

    await channel.assertQueue(resultsQueue);

    channel.consume(resultsQueue, async (message) => {
        const result = message.content.toString();
        logger.info(`Успешно обработанный и полученый результат: ${result}`)
        await channel.close();
        await connection.close();
        await axios.get('http://m2:4002/stop')
    }, { noAck: true });

}

const sendData = async (data) => {
    await connectQueue()
    await axios.get('http://m2:4002/start')
    await channel.sendToQueue(tasksQueue, Buffer.from(JSON.stringify(data)));
    logger.info(`Задание отправлено в очередь: ${JSON.stringify(data)}`);
    listenForResults()
}

app.post("/send-msg", (req, res) => {
    let data = req.body.task

    sendData(data);
    logger.info('Запрос на обработку получен:', data);
    res.send("Message Sent");

})


app.listen(PORT, () => logger.info(`Сервер М1 запущен на порту ${PORT}`));