package com.plantbuddy.viewmodel;

import androidx.lifecycle.*;
import com.plantbuddy.model.Plant;
import com.plantbuddy.network.dto.PlantRequest;
import com.plantbuddy.repository.PlantRepository;
import java.util.List;

public class PlantsViewModel extends ViewModel {
    private final PlantRepository plantRepository;
    private final MutableLiveData<List<Plant>> plants = new MutableLiveData<>();
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>(false);
    private final MutableLiveData<String> error = new MutableLiveData<>();
    private final MutableLiveData<Boolean> plantSaved = new MutableLiveData<>();
    public PlantsViewModel(PlantRepository plantRepository) { this.plantRepository = plantRepository; }
    public LiveData<List<Plant>> getPlants() { return plants; }
    public LiveData<Boolean> getLoading() { return loading; }
    public LiveData<String> getError() { return error; }
    public LiveData<Boolean> getPlantSaved() { return plantSaved; }
    public void loadPlants() {
        loading.setValue(true); plantRepository.getPlants(new com.plantbuddy.repository.RepositoryCallback<>() {
        @Override public void onSuccess(List<Plant> value) { loading.postValue(false); plants.postValue(value); }
        @Override public void onError(String message) { loading.postValue(false); error.postValue(message); }
        });
    }
    public void createPlant(PlantRequest request) {
        loading.setValue(true); plantRepository.createPlant(request, new com.plantbuddy.repository.RepositoryCallback<>() {
        @Override public void onSuccess(Plant value) { loading.postValue(false); plantSaved.postValue(true); }
        @Override public void onError(String message) { loading.postValue(false); error.postValue(message); }
        });
    }
}
