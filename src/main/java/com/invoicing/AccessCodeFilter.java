package com.invoicing;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AccessCodeFilter extends OncePerRequestFilter {

    @Value("${app.access-code}")
    private String accessCode;

    protected void setResponse(HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"message\": \"Cod de acces invalid\"}");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if(request.getMethod().equals("GET")){
            filterChain.doFilter(request,response);
            return;
        }
        String codPrimit = request.getHeader("X-Access-Code");
        if(codPrimit == null){
            response.setStatus(403);
            setResponse(response);
            return;
        }
        if(codPrimit.isBlank() || !codPrimit.equals(accessCode)){
            response.setStatus(403);
            setResponse(response);
            return;
        }

        filterChain.doFilter(request,response);

    }
}
