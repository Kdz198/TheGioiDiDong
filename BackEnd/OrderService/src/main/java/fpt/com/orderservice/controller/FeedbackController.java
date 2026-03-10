package fpt.com.orderservice.controller;

import fpt.com.orderservice.model.Feedback;
import fpt.com.orderservice.model.dto.FeedbackRequest;
import fpt.com.orderservice.model.dto.FeedbackResponse;
import fpt.com.orderservice.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(@PathVariable int id) {
        return ResponseEntity.ok(feedbackService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Feedback> createFeedback(@RequestBody FeedbackRequest feedback) {
        return ResponseEntity.ok(feedbackService.save(feedback));
    }

    @PutMapping
    public ResponseEntity<Feedback> updateFeedback(@RequestBody Feedback feedback) {
        return ResponseEntity.ok(feedbackService.update(feedback));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable int id) {
        feedbackService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Feedback>> getByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(feedbackService.findByUserId(userId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<FeedbackResponse>> getByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(feedbackService.findByProductId(productId));
    }

}

