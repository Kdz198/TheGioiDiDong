package fpt.com.orderservice.model.dto;


import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Data
public class FeedbackRequest {
    int userId;
    int productId;
    int rating;
    String comment;
    int orderDetailId;
}
