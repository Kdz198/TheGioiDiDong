package fpt.com.orderservice.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentStatusResponse {
    private String code;
    private String desc;
    private PaymentStatusData data;
}