package fpt.com.orderservice.service.impl;

import fpt.com.orderservice.model.Payment;
import fpt.com.orderservice.model.enums.PaymentStatus;
import fpt.com.orderservice.repo.PaymentRepo;
import fpt.com.orderservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepo paymentRepo;

    @Override
    public List<Payment> findAll() {
        return paymentRepo.findAll();
    }

    @Override
    public Payment findById(int id) {
        return paymentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    @Override
    public Payment save(Payment payment) {
        return paymentRepo.save(payment);
    }

    @Override
    public Payment update(Payment payment) {
        if (!paymentRepo.existsById(payment.getId())) {
            throw new RuntimeException("Payment not found with id: " + payment.getId());
        }
        return paymentRepo.save(payment);
    }

    @Override
    public void deleteById(int id) {
        paymentRepo.deleteById(id);
    }

    @Override
    public List<Payment> findByOrderId(int orderId) {
        return paymentRepo.findByOrderId(orderId);
    }

    @Override
    public List<Payment> findByStatus(PaymentStatus status) {
        return paymentRepo.findByStatus(status);
    }
}

