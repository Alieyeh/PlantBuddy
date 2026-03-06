package com.plantbuddy.ui;

import android.content.Intent;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.plantbuddy.R;
import com.plantbuddy.storage.SessionManager;

public class MainActivity extends AppCompatActivity {
    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState); setContentView(R.layout.activity_main);
        SessionManager sessionManager = new SessionManager(this);
        startActivity(new Intent(this, sessionManager.isLoggedIn() ? PlantsActivity.class : LoginActivity.class));
        finish();
    }
}
