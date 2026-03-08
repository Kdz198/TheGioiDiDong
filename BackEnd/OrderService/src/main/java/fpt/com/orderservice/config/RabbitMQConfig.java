package fpt.com.orderservice.config;

import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RabbitMQConfig {
    public static final String ORDER_QUEUE_NAME = "tgdd.order.queue";
    public static final String EXCHANGE_NAME = "tgdd.exchange";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }
    @Bean
    public Queue orderQueue() {
        return new Queue(ORDER_QUEUE_NAME, true);
    }

}
