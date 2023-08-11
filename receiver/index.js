const express = require("express");
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.urlencoded());
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: '/app/logs/worker.log' })
    ]
});

const PORT = process.env.PORT || 4002;

const amqp = require("amqplib");
let channel, connection;


app.get("/start", async (req, res) => {
    await connectQueue();
    res.send("M2 started");
  });
  
  app.get("/stop", async (req, res) => {
    await closeQueue();
    res.send("M2 stopped");
});
  

async function connectQueue() {
    try {

        connection = await amqp.connect("amqp://rabbitmq:5672");
        channel = await connection.createChannel()  
        logger.info(`Вновь созданное подлючение обработчика`)
        const tasksQueue = 'tasksQueue';
        const resultsQueue = 'resultsQueue';
        await channel.assertQueue(tasksQueue)
        await channel.assertQueue(resultsQueue)
        channel.consume(tasksQueue, async (message) => {
            const input = JSON.parse(message.content.toString());
            const result = await processTask(input);
            logger.info(`Задание обработано успешно и результат отправлен в очередь: ${result}`);
            channel.sendToQueue(resultsQueue, Buffer.from(result));
            channel.ack(message);
        })

    } catch (error) {
        logger.error(`Ошибка при создании канала или подключения к RabbitMQ receiver: ${error.message}`);
    }
}

async function closeQueue() {
    try {
      if (channel) {
        await channel.close();
        logger.info("Channel closed");
      }
      if (connection) {
        await connection.close();
        logger.info("Connection closed");
      }
    } catch (error) {
      logger.error(`Error during cleanup: ${error.message}`);
    }
  }

async function processTask(task) {
    try {
        if (task == '1') {
            logger.info(`Задание ${task} обработано успешно`);
            return `Задание номер ${task} выполнено`
        } else if (task == '2') {
            logger.info(`Задание ${task} обработано успешно`);
            return `Задание номер ${task} выполнено`
        } else if (task == '3') {
            logger.info(`Задание ${task} обработано успешно`);
            return `Задание номер ${task} выполнено`
        }
        logger.info(`Задание ${task} нет в нашем трекере`);
        return `Задания под номер ${task} отсутствует в трекере задач`;
    } catch(error) {
        logger.error(`Ошибка при обработке задания: ${error.message}`);
        throw error;
    }
}

app.listen(PORT, () => logger.info("Server running at port " + PORT));