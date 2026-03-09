package fpt.com.orderservice.config;

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
    public static final String ORDER_QUEUE_NAME = "tgdd.order.queue";
    public static final String EXCHANGE_NAME = "tgdd.exchange";
    public static final String PRODUCT_QUEUE_NAME = "tgdd.product.queue";
    @Value("${app.rabbitmq.prefix}")
    String prefix;

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(prefix+"." +EXCHANGE_NAME);
    }

    @Bean
    public Queue orderQueue() {
        return new Queue(prefix+"." + ORDER_QUEUE_NAME, true);
    }

    @Bean
    public Queue productQueue() {
        return new Queue(prefix + "." + PRODUCT_QUEUE_NAME, true);
    }

    @Bean
    public Binding bindingProductDeduct(Queue productQueue, DirectExchange exchange) {
        return BindingBuilder.bind(productQueue).to(exchange).with("payment.success");
    }
    @Bean
    public Binding bindingProductRollback(Queue productQueue, DirectExchange exchange) {
        return BindingBuilder.bind(productQueue).to(exchange).with("payment.fail");
    }
}
