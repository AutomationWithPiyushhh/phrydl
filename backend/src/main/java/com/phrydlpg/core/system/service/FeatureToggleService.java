package com.phrydlpg.core.system.service;

import com.phrydlpg.core.system.entity.FeatureToggle;
import com.phrydlpg.core.system.repository.FeatureToggleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FeatureToggleService {

    private final FeatureToggleRepository featureToggleRepository;

    public List<FeatureToggle> getAllFeatures() {
        return featureToggleRepository.findAll();
    }

    public boolean isFeatureEnabled(String featureKey) {
        return featureToggleRepository.findByFeatureKey(featureKey)
                .map(FeatureToggle::isEnabled)
                .orElse(false);
    }

    public FeatureToggle updateFeature(FeatureToggle dto) {
        Optional<FeatureToggle> existing = featureToggleRepository.findByFeatureKey(dto.getFeatureKey());
        if (existing.isPresent()) {
            FeatureToggle feature = existing.get();
            feature.setEnabled(dto.isEnabled());
            if (dto.getDescription() != null) {
                feature.setDescription(dto.getDescription());
            }
            return featureToggleRepository.save(feature);
        } else {
            return featureToggleRepository.save(dto);
        }
    }
}
