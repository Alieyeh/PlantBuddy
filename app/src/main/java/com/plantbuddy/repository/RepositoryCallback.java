package com.plantbuddy.repository;
public interface RepositoryCallback<T>{
    void onSuccess(T value); void onError(String message);
}