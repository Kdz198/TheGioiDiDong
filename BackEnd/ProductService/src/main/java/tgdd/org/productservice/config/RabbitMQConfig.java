package tgdd.org.productservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;

import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "tgdd.product.queue";
    public static final String EXCHANGE_NAME = "tgdd.exchange";
    public static final String ROUTING_KEY = "tgdd.routing.key";

    public static final String ORDER_QUEUE_NAME = "tgdd.order.queue";
    public static final String PRODUCT_QUEUE_NAME = "tgdd.product.queue";
    @Value("${app.rabbitmq.prefix}")
    String prefix;

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public Queue orderQueue() {
        return new Queue(prefix + "." + ORDER_QUEUE_NAME, true);
    }

    @Bean
    public Queue productQueue() {
        return new Queue(prefix + "." + PRODUCT_QUEUE_NAME, true);
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(prefix+"." +EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }

    @Bean
    public Binding bindingOrderAvailable(Queue orderQueue, DirectExchange exchange) {
        return BindingBuilder.bind(orderQueue).to(exchange).with("product.available");
    }

    @Bean
    public Binding bindingOrderOutOfStock(Queue orderQueue, DirectExchange exchange) {
        return BindingBuilder.bind(orderQueue).to(exchange).with("product.outOfStock");
    }


}