# NodeJS-RabbitMQ
Перед началом, убедитесь что у вас есть установленный docker, postman и свободны порты: 4002,4001,15672,5672
## Инструкции для запуска

###
Создайте папку на рабочем столе и откройте ее в VSCode
###
Откройте терминал и следуйте следующим инструкциям
###
git clone https://github.com/AibekKatenov/NodeJS-RabbitMQ.git
###
cd NodeJS-RabbitMQ
###
docker-compose up --build
###
после успешного запуска программы(желательно подождите 1-2 минуты чтобы все контейнеры поднялись, особенно rabbitmq). 
Откройте postman и создайте post-запрос со следующим url: 'localhost:4001/send-msg'. В body откройте x-www-form-urlencoded
и создайте ключ-значение: task-<цифра от 1 до 3, либо что угодно>.
###
![image](https://github.com/AibekKatenov/NodeJS-RabbitMQ/assets/98681629/2fc6c64a-711e-4f27-aa33-cafafad397f5)
### 
Теперь можете посылать запросы, все ответы и информацию можно посмотреть в папке logs
