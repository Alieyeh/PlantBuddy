package com.plantbuddy.network.dto;
public class LoginRequest{
    private final String usernameOrEmail;
    private final String password;

    public LoginRequest(String usernameOrEmail,String password) {
        this.usernameOrEmail=usernameOrEmail;this.password=password;
    }
}