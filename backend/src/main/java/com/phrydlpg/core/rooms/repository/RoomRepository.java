package com.phrydlpg.core.rooms.repository;
import com.phrydlpg.core.rooms.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findByProperty_Id(UUID propertyId);
}
