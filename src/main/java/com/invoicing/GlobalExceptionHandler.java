package com.invoicing;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String,String>> handleNotFount(ResourceNotFoundException exception){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", exception.getMessage()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> invalidArgument(MethodArgumentNotValidException exception){
        List<String> mesaje = new ArrayList<>();
        for(FieldError ex : exception.getBindingResult().getFieldErrors()){
            mesaje.add(ex.getDefaultMessage());
        }
        String text = String.join(", ", mesaje);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", text));
    }
}
