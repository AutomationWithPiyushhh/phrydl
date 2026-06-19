package com.phrydlpg.core.rooms.service;

import com.phrydlpg.core.rooms.dto.RoomDto;
import com.phrydlpg.core.rooms.entity.Bed;
import com.phrydlpg.core.rooms.entity.Room;
import com.phrydlpg.core.rooms.repository.BedRepository;
import com.phrydlpg.core.rooms.repository.RoomRepository;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import com.phrydlpg.core.properties.entity.Property;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;

    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public RoomDto createRoom(RoomDto dto) {
        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        Room room = Room.builder()
                .property(property)
                .roomNumber(dto.getRoomNumber())
                .type(dto.getType())
                .status("AVAILABLE")
                .build();
        room = roomRepository.save(room);

        // create beds based on type
        int numBeds = "1-Sharing".equals(dto.getType()) ? 1 :
                      "2-Sharing".equals(dto.getType()) ? 2 :
                      "3-Sharing".equals(dto.getType()) ? 3 : 2;

        for (int i = 1; i <= numBeds; i++) {
            bedRepository.save(Bed.builder()
                    .room(room)
                    .bedNumber("B" + i)
                    .status("AVAILABLE")
                    .build());
        }

        return mapToDto(room);
    }

    public RoomDto updateRoom(UUID id, RoomDto dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        if (dto.getRoomNumber() != null) room.setRoomNumber(dto.getRoomNumber());
        if (dto.getType() != null) room.setType(dto.getType());
        if (dto.getStatus() != null) room.setStatus(dto.getStatus());

        return mapToDto(roomRepository.save(room));
    }

    public void deleteRoom(UUID id) {
        if (!roomRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }
        roomRepository.deleteById(id);
    }

    // Bed operations
    public void allocateBed(UUID bedId, UUID tenantId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bed not found"));
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        bed.setStatus("OCCUPIED");
        tenant.setBed(bed);
        
        bedRepository.save(bed);
        tenantRepository.save(tenant);
    }

    public void vacateBed(UUID bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bed not found"));
        
        // Find tenant in this bed
        tenantRepository.findAll().stream()
                .filter(t -> t.getBed() != null && t.getBed().getId().equals(bedId))
                .findFirst()
                .ifPresent(t -> {
                    t.setBed(null);
                    tenantRepository.save(t);
                });

        bed.setStatus("AVAILABLE");
        bedRepository.save(bed);
    }

    public void maintainBed(UUID bedId, boolean isMaintenance) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bed not found"));
        bed.setStatus(isMaintenance ? "MAINTENANCE" : "AVAILABLE");
        bedRepository.save(bed);
    }

    private RoomDto mapToDto(Room room) {
        List<Bed> beds = bedRepository.findAll(); // Optimization needed in real app
        List<RoomDto.BedDto> bedDtos = beds.stream()
                .filter(b -> b.getRoom().getId().equals(room.getId()))
                .map(b -> {
                    // In a real application, tenant association would be fetched via join to avoid n+1
                    return RoomDto.BedDto.builder()
                            .id(b.getId())
                            .bedNumber(b.getBedNumber())
                            .status(b.getStatus())
                            .tenantName(b.getStatus().equals("OCCUPIED") ? "Occupied Tenant" : null) 
                            .build();
                })
                .collect(Collectors.toList());

        return RoomDto.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .type(room.getType())
                .status(room.getStatus())
                .propertyName(room.getProperty().getName())
                .propertyId(room.getProperty().getId())
                .beds(bedDtos)
                .build();
    }
}
