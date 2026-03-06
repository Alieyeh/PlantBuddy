package com.plantbuddy.viewmodel;

import androidx.lifecycle.*;
import com.plantbuddy.repository.AuthRepository;

public class LoginViewModel extends ViewModel {
    private final AuthRepository authRepository;
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>(false);
    private final MutableLiveData<String> error = new MutableLiveData<>();
    private final MutableLiveData<Boolean> success = new MutableLiveData<>();
    public LoginViewModel(AuthRepository authRepository) { this.authRepository = authRepository; }
    public LiveData<Boolean> getLoading() { return loading; }
    public LiveData<String> getError() { return error; }
    public LiveData<Boolean> getSuccess() { return success; }
    public void login(String usernameOrEmail, String password) {
        loading.setValue(true); authRepository.login(usernameOrEmail, password, new com.plantbuddy.repository.RepositoryCallback<>() {
        @Override public void onSuccess(com.plantbuddy.model.AuthPayload value) { loading.postValue(false); success.postValue(true); }
        @Override public void onError(String message) { loading.postValue(false); error.postValue(message); }
        });
    }
}
