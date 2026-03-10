package fpt.com.orderservice.model.dto;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class FeedbackResponse {
    String userName;
    int productId;
    int rating;
    String comment;
    Timestamp date;
    int orderDetailId;
}
