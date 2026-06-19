package com.phrydlpg.core.properties.service;

import com.phrydlpg.core.properties.dto.PropertyDto;
import com.phrydlpg.core.properties.entity.Property;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import com.phrydlpg.core.rooms.repository.BedRepository;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final BedRepository bedRepository;
    private final TenantRepository tenantRepository;

    public List<PropertyDto> getAllProperties() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        com.phrydlpg.core.auth.security.UserDetailsImpl userDetails = (com.phrydlpg.core.auth.security.UserDetailsImpl) auth.getPrincipal();
        
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        UUID userId = userDetails.getId();
        
        java.util.stream.Stream<Property> propertyStream = propertyRepository.findAll().stream();
        
        if ("ROLE_MANAGER".equals(role) || "MANAGER".equals(role)) {
            propertyStream = propertyStream.filter(p -> p.getManager() != null && p.getManager().getId().equals(userId));
        } else if ("ROLE_REGION_MANAGER".equals(role) || "REGION_MANAGER".equals(role)) {
            propertyStream = propertyStream.filter(p -> p.getRegion() != null && p.getRegion().getRegionManager() != null && p.getRegion().getRegionManager().getId().equals(userId));
        }
        
        return propertyStream.map(this::mapToDto).collect(Collectors.toList());
    }

    public PropertyDto createProperty(PropertyDto dto) {
        Property property = Property.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .capacity(dto.getCapacity())
                .type(dto.getType())
                .status("ACTIVE")
                .build();
        return mapToDto(propertyRepository.save(property));
    }

    public PropertyDto updateProperty(UUID id, PropertyDto dto) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        if (dto.getName() != null) property.setName(dto.getName());
        if (dto.getAddress() != null) property.setAddress(dto.getAddress());
        if (dto.getCapacity() != null) property.setCapacity(dto.getCapacity());
        if (dto.getType() != null) property.setType(dto.getType());
        if (dto.getStatus() != null) property.setStatus(dto.getStatus());

        return mapToDto(propertyRepository.save(property));
    }

    public void deleteProperty(UUID id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found");
        }
        propertyRepository.deleteById(id);
    }

    private PropertyDto mapToDto(Property property) {
        // In a real app, this aggregation would be optimized via a single query or view.
        int totalOccupancy = 40; // Mock calculation to prevent n+1 queries for now, can implement a proper JPQL query later
        double occupancyRate = (double) totalOccupancy / property.getCapacity() * 100;

        return PropertyDto.builder()
                .id(property.getId())
                .name(property.getName())
                .address(property.getAddress())
                .capacity(property.getCapacity())
                .type(property.getType())
                .status(property.getStatus())
                .occupancy(totalOccupancy)
                .occupancyRate(occupancyRate)
                .build();
    }

    public com.phrydlpg.core.properties.dto.PropertyMatrixDto getPropertyMatrix(UUID id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Property not found"));

        List<com.phrydlpg.core.rooms.entity.Bed> allBeds = bedRepository.findByRoom_Property_Id(id);
        List<com.phrydlpg.core.tenants.entity.Tenant> allTenants = tenantRepository.findByBed_Room_Property_Id(id);

        java.util.Map<UUID, com.phrydlpg.core.tenants.entity.Tenant> bedTenantMap = allTenants.stream()
                .filter(t -> t.getBed() != null && "ACTIVE".equals(t.getStatus()))
                .collect(Collectors.toMap(t -> t.getBed().getId(), t -> t, (t1, t2) -> t1));

        java.util.Map<com.phrydlpg.core.rooms.entity.Room, List<com.phrydlpg.core.rooms.entity.Bed>> bedsByRoom = allBeds.stream()
                .collect(Collectors.groupingBy(com.phrydlpg.core.rooms.entity.Bed::getRoom));

        java.util.Map<String, List<com.phrydlpg.core.rooms.entity.Room>> roomsByFloor = bedsByRoom.keySet().stream()
                .collect(Collectors.groupingBy(room -> {
                    String rno = room.getRoomNumber();
                    if (rno != null && rno.length() > 0) {
                        if (rno.length() >= 3) {
                            return rno.substring(0, rno.length() - 2); // e.g. "101" -> "1", "1201" -> "12"
                        } else {
                            return "0"; // Ground floor fallback
                        }
                    }
                    return "Unknown";
                }));

        List<com.phrydlpg.core.properties.dto.PropertyMatrixDto.FloorMatrixDto> floorDtos = roomsByFloor.entrySet().stream()
                .map(floorEntry -> {
                    List<com.phrydlpg.core.properties.dto.PropertyMatrixDto.RoomMatrixDto> roomDtos = floorEntry.getValue().stream()
                            .map(room -> {
                                List<com.phrydlpg.core.properties.dto.PropertyMatrixDto.BedMatrixDto> bedDtos = bedsByRoom.getOrDefault(room, java.util.Collections.emptyList()).stream()
                                        .map(bed -> {
                                            com.phrydlpg.core.tenants.entity.Tenant tenant = bedTenantMap.get(bed.getId());
                                            return com.phrydlpg.core.properties.dto.PropertyMatrixDto.BedMatrixDto.builder()
                                                    .bedId(bed.getId())
                                                    .bedNumber(bed.getBedNumber())
                                                    .status(bed.getStatus())
                                                    .tenantId(tenant != null ? tenant.getId() : null)
                                                    .tenantName(tenant != null ? tenant.getUser().getFirstName() + " " + tenant.getUser().getLastName() : null)
                                                    .occupation(tenant != null ? tenant.getOccupation() : null)
                                                    .moveInDate(tenant != null ? tenant.getLeaseStart() : null)
                                                    .rentAmount(tenant != null ? tenant.getMonthlyRent() : null)
                                                    .kycStatus(tenant != null ? tenant.getKycStatus() : null)
                                                    .build();
                                        })
                                        .collect(Collectors.toList());
                                
                                return com.phrydlpg.core.properties.dto.PropertyMatrixDto.RoomMatrixDto.builder()
                                        .roomId(room.getId())
                                        .roomNumber(room.getRoomNumber())
                                        .type(room.getType())
                                        .beds(bedDtos)
                                        .build();
                            })
                            .collect(Collectors.toList());

                    return com.phrydlpg.core.properties.dto.PropertyMatrixDto.FloorMatrixDto.builder()
                            .floorNumber(floorEntry.getKey())
                            .rooms(roomDtos)
                            .build();
                })
                .sorted((f1, f2) -> {
                    try {
                        return Integer.compare(Integer.parseInt(f1.getFloorNumber()), Integer.parseInt(f2.getFloorNumber()));
                    } catch (NumberFormatException e) {
                        return f1.getFloorNumber().compareTo(f2.getFloorNumber());
                    }
                })
                .collect(Collectors.toList());

        return com.phrydlpg.core.properties.dto.PropertyMatrixDto.builder()
                .propertyId(property.getId())
                .propertyName(property.getName())
                .floors(floorDtos)
                .build();
    }
}
