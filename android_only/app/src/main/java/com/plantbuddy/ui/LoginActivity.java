package com.plantbuddy.ui;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.plantbuddy.databinding.ActivityLoginBinding;
import com.plantbuddy.network.RetrofitClient;
import com.plantbuddy.repository.*;
import com.plantbuddy.storage.SessionManager;
import com.plantbuddy.viewmodel.*;

public class LoginActivity extends AppCompatActivity {
    private ActivityLoginBinding binding;
    private LoginViewModel viewModel;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState); binding = ActivityLoginBinding.inflate(getLayoutInflater()); setContentView(binding.getRoot());
        SessionManager sessionManager = new SessionManager(this); var api = RetrofitClient.getInstance(sessionManager).getApiService();

        viewModel = new ViewModelProvider(this, new ViewModelFactory(new AuthRepository(api, sessionManager), new PlantRepository(api))).get(LoginViewModel.class);
        binding.btnLogin.setOnClickListener(v -> attemptLogin()); binding.tvRegister.setOnClickListener(v -> startActivity(new Intent(this, RegisterActivity.class)));
        viewModel.getLoading().observe(this, l -> binding.progressBar.setVisibility(Boolean.TRUE.equals(l) ? View.VISIBLE : View.GONE));
        viewModel.getError().observe(this, e -> Toast.makeText(this, e, Toast.LENGTH_LONG).show());
        viewModel.getSuccess().observe(this, s -> { if (Boolean.TRUE.equals(s)) { startActivity(new Intent(this, PlantsActivity.class)); finish(); } });
    }
    private void attemptLogin() {
        String u = binding.etUsernameOrEmail.getText().toString().trim();
        String p = binding.etPassword.getText().toString();
        if (u.isEmpty() || p.isEmpty()) { Toast.makeText(this, "Enter username/email and password", Toast.LENGTH_SHORT).show();
            return; } viewModel.login(u, p);
    }
}
