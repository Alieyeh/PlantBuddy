package com.plantbuddy.ui;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.plantbuddy.databinding.ActivityRegisterBinding;
import com.plantbuddy.network.RetrofitClient;
import com.plantbuddy.repository.*;
import com.plantbuddy.storage.SessionManager;
import com.plantbuddy.viewmodel.*;

public class RegisterActivity extends AppCompatActivity {
    private ActivityRegisterBinding binding; private RegisterViewModel viewModel;
    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState); binding = ActivityRegisterBinding.inflate(getLayoutInflater()); setContentView(binding.getRoot());
        SessionManager sessionManager = new SessionManager(this); var api = RetrofitClient.getInstance(sessionManager).getApiService();
        viewModel = new ViewModelProvider(this, new ViewModelFactory(new AuthRepository(api, sessionManager), new PlantRepository(api))).get(RegisterViewModel.class);
        binding.btnRegister.setOnClickListener(v -> attemptRegister());
        viewModel.getLoading().observe(this, l -> binding.progressBar.setVisibility(Boolean.TRUE.equals(l) ? View.VISIBLE : View.GONE));
        viewModel.getError().observe(this, e -> Toast.makeText(this, e, Toast.LENGTH_LONG).show());
        viewModel.getSuccess().observe(this, s -> { if (Boolean.TRUE.equals(s)) { startActivity(new Intent(this, PlantsActivity.class)); finishAffinity(); } });
    }
    private void attemptRegister() {
        String d = binding.etDisplayName.getText().toString().trim(); String u = binding.etUsername.getText().toString().trim(); String e = binding.etEmail.getText().toString().trim(); String p = binding.etPassword.getText().toString();
        if (d.isEmpty() || u.isEmpty() || e.isEmpty() || p.length() < 8) { Toast.makeText(this, "Complete all fields and use a longer password", Toast.LENGTH_SHORT).show(); return; }
        viewModel.register(u, e, p, d);
    }
}
