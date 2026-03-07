package tgdd.org.userservice.Enum;

public enum Permission {

    // Quyền của USER
    CREATE_ORDER,
    VIEW_OWN_ORDER,
    CREATE_REVIEW,

    //Quyền của User VIP
    ACCESS_VIP_DISCOUNTS,

    // Quyền thêm của STAFF
    CREATE_PRODUCT,
    UPDATE_PRODUCT,
    VIEW_ALL_ORDERS,
    UPDATE_ORDER_STATUS,

    // Quyền thêm của ADMIN
    DELETE_PRODUCT,
    MANAGE_STAFF,
    VIEW_REVENUE_REPORT
}
