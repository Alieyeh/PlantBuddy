package com.plantbuddy.ui.adapter;

import android.view.*;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.plantbuddy.databinding.ItemPlantBinding;
import com.plantbuddy.model.Plant;
import java.util.*;

public class PlantsAdapter extends RecyclerView.Adapter<PlantsAdapter.PlantViewHolder> {
    private final List<Plant> plants = new ArrayList<>();
    public void submitList(List<Plant> newPlants) {
        plants.clear();
        if (newPlants != null) plants.addAll(newPlants);
        notifyDataSetChanged();
    }
    @NonNull @Override public PlantViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) { return new PlantViewHolder(ItemPlantBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false)); }
    @Override public void onBindViewHolder(@NonNull PlantViewHolder holder, int position) { holder.bind(plants.get(position)); }
    @Override public int getItemCount() { return plants.size(); }
    static class PlantViewHolder extends RecyclerView.ViewHolder {
        private final ItemPlantBinding binding;
        PlantViewHolder(ItemPlantBinding binding){
            super(binding.getRoot());
            this.binding=binding;
        }
        void bind(Plant plant){
            binding.tvName.setText(plant.getName());
            binding.tvSubtitle.setText((plant.getSpecies()==null?"Unknown species":plant.getSpecies()) + " • " + (plant.getRoom()==null?"No room":plant.getRoom()));
        }
    }
}
