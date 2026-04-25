//package syncX.modules.candidatedashboard.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import syncX.modules.candidatedashboard.dto.DashboardResponseDto;
//import syncX.modules.candidatedashboard.service.CandidateDashboardService;
//
//@RestController
//@RequestMapping("/api/dashboard/candidate")
//@CrossOrigin(origins = "http://localhost:5173")
//public class CandidateDashboardController {
//
//    @Autowired
//    private CandidateDashboardService dashboardService;
//
//    @GetMapping("/{candidateId}")
//    public ResponseEntity<DashboardResponseDto> getDashboardData(@PathVariable Long candidateId) {
//        DashboardResponseDto data = dashboardService.getDashboardData(candidateId);
//        return ResponseEntity.ok(data);
//    }
//
//    @PostMapping("/seed/{candidateId}")
//    public ResponseEntity<String> seedData(@PathVariable Long candidateId) {
//        dashboardService.seedDummyData(candidateId);
//        return ResponseEntity.ok("Dummy data seeded successfully for candidate " + candidateId);
//    }
//}
