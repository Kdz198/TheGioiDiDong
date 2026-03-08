package fpt.com.orderservice.model.dto;

import fpt.com.orderservice.model.OrderDetail;
import fpt.com.orderservice.model.enums.OrderStatus;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

@Data
public class OrderRequest {
    int userId;
    OrderStatus status;
    int totalPrice;
    int basePrice;
    String orderCode;
    //order detail
    List<OrderDetailRequest> orderDetails;

    @Data
    public static class OrderDetailRequest{
        int productId;
        int quantity;
        int subtotal;
        String type;
        //nếu type là buy thì là mua - subtotal sẽ là price của product * quantity, nếu type là gift thì là tặng - subtotal sẽ là 0
        //nếu sản phẩm là mua 1 tặng 1 thì sẽ tạo 2 order detail, 1 loại buy và 1 loại gift
    }
}

