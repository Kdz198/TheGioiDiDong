package fpt.com.orderservice.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentStatusData {
    private String status;
    private Long orderCode;
    private Integer amount;
}