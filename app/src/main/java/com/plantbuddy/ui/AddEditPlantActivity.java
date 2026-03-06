package com.plantbuddy.ui;

import android.os.Bundle;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import com.plantbuddy.databinding.ActivityAddEditPlantBinding;
import com.plantbuddy.network.RetrofitClient;
import com.plantbuddy.network.dto.PlantRequest;
import com.plantbuddy.repository.*;
import com.plantbuddy.storage.SessionManager;
import com.plantbuddy.viewmodel.*;

public class AddEditPlantActivity extends AppCompatActivity {
    private ActivityAddEditPlantBinding binding; private PlantsViewModel viewModel;
    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState); binding = ActivityAddEditPlantBinding.inflate(getLayoutInflater()); setContentView(binding.getRoot());
        SessionManager sessionManager = new SessionManager(this); var api = RetrofitClient.getInstance(sessionManager).getApiService();
        viewModel = new ViewModelProvider(this, new ViewModelFactory(new AuthRepository(api, sessionManager), new PlantRepository(api))).get(PlantsViewModel.class);
        binding.btnSave.setOnClickListener(v -> savePlant()); viewModel.getError().observe(this, e -> Toast.makeText(this, e, Toast.LENGTH_LONG).show()); viewModel.getPlantSaved().observe(this, s -> { if (Boolean.TRUE.equals(s)) { Toast.makeText(this, "Plant saved", Toast.LENGTH_SHORT).show(); finish(); } });
    }
    private void savePlant() {
        String name = binding.etName.getText().toString().trim();
        if (name.isEmpty()) {
            Toast.makeText(this, "Plant name is required", Toast.LENGTH_SHORT).show();
            return; }
        PlantRequest request = new PlantRequest(name, binding.etSpecies.getText().toString().trim(), null, binding.etRoom.getText().toString().trim(), binding.etCareNotes.getText().toString().trim(), binding.etLight.getText().toString().trim(), parseInteger(binding.etWaterFreq.getText().toString()), parseInteger(binding.etWaterVol.getText().toString()), null, null, null, null, binding.etQuirk.getText().toString().trim());
        viewModel.createPlant(request);
    }
    private Integer parseInteger(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try { return Integer.parseInt(value.trim()); }
        catch (NumberFormatException ignored) { return null; }
    }
}
