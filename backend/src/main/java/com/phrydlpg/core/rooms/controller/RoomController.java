package com.phrydlpg.core.rooms.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.rooms.dto.RoomDto;
import com.phrydlpg.core.rooms.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<List<RoomDto>> getAllRooms() {
        return ApiResponse.success("Rooms retrieved successfully", roomService.getAllRooms());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<RoomDto> createRoom(@RequestBody RoomDto dto) {
        return ApiResponse.success("Room created successfully", roomService.createRoom(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<RoomDto> updateRoom(@PathVariable UUID id, @RequestBody RoomDto dto) {
        return ApiResponse.success("Room updated successfully", roomService.updateRoom(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<Void> deleteRoom(@PathVariable UUID id) {
        roomService.deleteRoom(id);
        return ApiResponse.success("Room deleted successfully", null);
    }

    @PostMapping("/beds/{bedId}/allocate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<Void> allocateBed(@PathVariable UUID bedId, @RequestParam UUID tenantId) {
        roomService.allocateBed(bedId, tenantId);
        return ApiResponse.success("Bed allocated successfully", null);
    }

    @PostMapping("/beds/{bedId}/vacate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<Void> vacateBed(@PathVariable UUID bedId) {
        roomService.vacateBed(bedId);
        return ApiResponse.success("Bed vacated successfully", null);
    }

    @PostMapping("/beds/{bedId}/maintain")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<Void> maintainBed(@PathVariable UUID bedId, @RequestParam boolean isMaintenance) {
        roomService.maintainBed(bedId, isMaintenance);
        return ApiResponse.success("Bed maintenance status updated", null);
    }
}
