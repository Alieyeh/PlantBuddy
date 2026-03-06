package com.plantbuddy.repository;

import com.plantbuddy.model.*;
import com.plantbuddy.network.ApiService;
import com.plantbuddy.network.dto.PlantRequest;
import java.util.List;
import retrofit2.*;

public class PlantRepository {
    private final ApiService apiService;
    public PlantRepository(ApiService apiService) { this.apiService = apiService; }
    public void getPlants(RepositoryCallback<List<Plant>> callback) {
        apiService.getPlants().enqueue(new Callback<>() {
            @Override public void onResponse(Call<ApiResponse<List<Plant>>> call, Response<ApiResponse<List<Plant>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) callback.onSuccess(response.body().getData());
                else callback.onError("Failed to load plants");
            }
            @Override public void onFailure(Call<ApiResponse<List<Plant>>> call, Throwable t) { callback.onError(t.getMessage() != null ? t.getMessage() : "Network error"); }
        });
    }
    public void createPlant(PlantRequest request, RepositoryCallback<Plant> callback) {
        apiService.createPlant(request).enqueue(new Callback<>() {
            @Override public void onResponse(Call<ApiResponse<Plant>> call, Response<ApiResponse<Plant>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) callback.onSuccess(response.body().getData());
                else callback.onError("Failed to save plant");
            }
            @Override public void onFailure(Call<ApiResponse<Plant>> call, Throwable t) { callback.onError(t.getMessage() != null ? t.getMessage() : "Network error"); }
        });
    }
}
