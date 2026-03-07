package tgdd.org.apigateway;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.reactivestreams.Publisher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Component

public class SwaggerServerRewriteFilter implements WebFilter {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SwaggerServerRewriteFilter.class);

    @Value("${app.openapi.dev-url:http://localhost:8090}")
    private String devUrl;

    @Value("${APP_OPENAPI_PROD_URL:http://comingsoon.com}")
    private String prodUrl;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        log.info(">>> FILTER HIT: {}", path);  // log mọi request

        if (!path.endsWith("/v3/api-docs")) {
            return chain.filter(exchange);
        }

        log.info(">>> INTERCEPTING API-DOCS for path: {}", path);

        ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(exchange.getResponse()) {
            @Override
            public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                log.info(">>> writeWith called, Content-Encoding: {}",
                        exchange.getResponse().getHeaders().getFirst("Content-Encoding"));

                if (body instanceof Flux) {
                    Flux<? extends DataBuffer> fluxBody = (Flux<? extends DataBuffer>) body;
                    return super.writeWith(fluxBody.buffer().map(dataBuffers -> {
                        DataBufferFactory factory = exchange.getResponse().bufferFactory();
                        byte[] bytes = dataBuffers.stream()
                                .map(b -> {
                                    byte[] arr = new byte[b.readableByteCount()];
                                    b.read(arr);
                                    DataBufferUtils.release(b);
                                    return arr;
                                })
                                .reduce(new byte[0], (a, b) -> {
                                    byte[] result = new byte[a.length + b.length];
                                    System.arraycopy(a, 0, result, 0, a.length);
                                    System.arraycopy(b, 0, result, a.length, b.length);
                                    return result;
                                });
                        try {
                            log.info(">>> Raw response bytes length: {}", bytes.length);
                            log.info(">>> Raw response preview: {}", new String(bytes, 0, Math.min(200, bytes.length)));

                            JsonNode node = objectMapper.readTree(bytes);
                            List<Map<String, String>> servers = new java.util.ArrayList<>();
                            servers.add(Map.of("url", devUrl, "description", "Local Development"));
                            if (prodUrl != null && !prodUrl.isBlank()) {
                                servers.add(Map.of("url", prodUrl, "description", "Production"));
                            }
                            ((ObjectNode) node).set("servers", objectMapper.valueToTree(servers));
                            ObjectNode securitySchemes = objectMapper.createObjectNode();
                            ObjectNode bearerScheme = objectMapper.createObjectNode();
                            bearerScheme.put("type", "http");
                            bearerScheme.put("scheme", "bearer");
                            bearerScheme.put("bearerFormat", "JWT");
                            securitySchemes.set("bearerAuth", bearerScheme);

                            ObjectNode components = (ObjectNode) node.get("components");
                            if (components == null) {
                                components = objectMapper.createObjectNode();
                                ((ObjectNode) node).set("components", components);
                            }
                            components.set("securitySchemes", securitySchemes);

                            ((ObjectNode) node).set("security",
                                    objectMapper.createArrayNode().add(
                                            objectMapper.createObjectNode().set("bearerAuth",
                                                    objectMapper.createArrayNode())
                                    )
                            );
                            bytes = objectMapper.writeValueAsBytes(node);
                            exchange.getResponse().getHeaders().setContentLength(bytes.length);
                            log.info(">>> Successfully rewrote servers to: {}", servers);
                        } catch (Exception e) {
                            log.error(">>> FAILED to rewrite JSON: {}", e.getMessage(), e);
                        }
                        return factory.wrap(bytes);
                    }));
                }
                return super.writeWith(body);
            }
        };

        return chain.filter(exchange.mutate().response(decoratedResponse).build());
    }
}