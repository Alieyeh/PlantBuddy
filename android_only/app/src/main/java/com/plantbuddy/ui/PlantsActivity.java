package com.plantbuddy.ui;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.plantbuddy.databinding.ActivityPlantsBinding;
import com.plantbuddy.network.RetrofitClient;
import com.plantbuddy.repository.*;
import com.plantbuddy.storage.SessionManager;
import com.plantbuddy.ui.adapter.PlantsAdapter;
import com.plantbuddy.viewmodel.*;

public class PlantsActivity extends AppCompatActivity {
    private ActivityPlantsBinding binding;
    private PlantsViewModel viewModel;
    private SessionManager sessionManager;
    private final PlantsAdapter adapter = new PlantsAdapter();
    private final ActivityResultLauncher<Intent> addPlantLauncher = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> viewModel.loadPlants());

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState); binding = ActivityPlantsBinding.inflate(getLayoutInflater()); setContentView(binding.getRoot());
        sessionManager = new SessionManager(this); var api = RetrofitClient.getInstance(sessionManager).getApiService();
        viewModel = new ViewModelProvider(this, new ViewModelFactory(new AuthRepository(api, sessionManager), new PlantRepository(api))).get(PlantsViewModel.class);
        binding.recyclerPlants.setLayoutManager(new LinearLayoutManager(this)); binding.recyclerPlants.setAdapter(adapter);
        binding.btnAddPlant.setOnClickListener(v -> addPlantLauncher.launch(new Intent(this, AddEditPlantActivity.class)));
        binding.btnLogout.setOnClickListener(v -> { sessionManager.clear(); startActivity(new Intent(this, LoginActivity.class)); finishAffinity(); });
        viewModel.getPlants().observe(this, adapter::submitList); viewModel.getLoading().observe(this, l -> binding.progressBar.setVisibility(Boolean.TRUE.equals(l) ? View.VISIBLE : View.GONE)); viewModel.getError().observe(this, e -> Toast.makeText(this, e, Toast.LENGTH_LONG).show());
        viewModel.loadPlants();
    }
}
