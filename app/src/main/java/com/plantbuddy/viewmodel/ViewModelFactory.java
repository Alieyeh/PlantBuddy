package com.plantbuddy.viewmodel;

import androidx.annotation.NonNull;
import androidx.lifecycle.*;
import com.plantbuddy.repository.*;

public class ViewModelFactory implements ViewModelProvider.Factory {
    private final AuthRepository authRepository;
    private final PlantRepository plantRepository;
    public ViewModelFactory(AuthRepository authRepository, PlantRepository plantRepository) { this.authRepository = authRepository; this.plantRepository = plantRepository; }
    @NonNull @Override @SuppressWarnings("unchecked") public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        if (modelClass.isAssignableFrom(LoginViewModel.class)) return (T) new LoginViewModel(authRepository);
        if (modelClass.isAssignableFrom(RegisterViewModel.class)) return (T) new RegisterViewModel(authRepository);
        if (modelClass.isAssignableFrom(PlantsViewModel.class)) return (T) new PlantsViewModel(plantRepository);
        throw new IllegalArgumentException("Unknown ViewModel class");
    }
}
