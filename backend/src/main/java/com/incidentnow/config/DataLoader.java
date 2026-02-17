package com.incidentnow.config;

import com.incidentnow.entity.*;
import com.incidentnow.model.*;
import com.incidentnow.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Component
@ConditionalOnProperty(name = "app.data.language", havingValue = "en")
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

        private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

        private final OwnerRepository ownerRepository;
        private final SupportEngineerRepository supportEngineerRepository;
        private final IncidentRepository incidentRepository;
        private final CommentRepository commentRepository;
        private final TimelineEventRepository timelineEventRepository;

        @Override
        public void run(String... args) {
                if (ownerRepository.count() > 0) {
                        log.info("Data already loaded, skipping...");
                        return;
                }

                log.info("Loading sample data...");

                // Create owners
                Owner alice = ownerRepository.save(Owner.builder()
                                .name("Alice Johnson")
                                .email("alice@incidentnow.io")
                                .password("demo1234")
                                .phone("+1-555-0101")
                                .team("Platform Engineering")
                                .role(OwnerRole.SENIOR_ENGINEER)
                                .department("Engineering")
                                .timezone("America/New_York")
                                .slackHandle("@alice.j")
                                .githubUsername("alicej")
                                .active(true)
                                .build());

                Owner bob = ownerRepository.save(Owner.builder()
                                .name("Bob Smith")
                                .email("bob@incidentnow.io")
                                .password("demo1234")
                                .phone("+1-555-0102")
                                .team("Infrastructure")
                                .role(OwnerRole.ENGINEER)
                                .department("Engineering")
                                .timezone("America/Chicago")
                                .slackHandle("@bob.s")
                                .githubUsername("bobsmith")
                                .active(true)
                                .build());

                Owner carol = ownerRepository.save(Owner.builder()
                                .name("Carol Williams")
                                .email("carol@incidentnow.io")
                                .password("demo1234")
                                .phone("+1-555-0103")
                                .team("Security")
                                .role(OwnerRole.TEAM_LEAD)
                                .department("Security")
                                .timezone("America/Los_Angeles")
                                .slackHandle("@carol.w")
                                .githubUsername("carolw")
                                .active(true)
                                .build());

                Owner dave = ownerRepository.save(Owner.builder()
                                .name("Dave Brown")
                                .email("dave@incidentnow.io")
                                .password("demo1234")
                                .team("Platform Engineering")
                                .role(OwnerRole.MANAGER)
                                .department("Engineering")
                                .timezone("Europe/London")
                                .active(true)
                                .build());

                // Create support engineers
                SupportEngineer seRaj = supportEngineerRepository.save(SupportEngineer.builder()
                                .name("Raj Patel")
                                .email("raj@incidentnow.io")
                                .phone("+1-555-0201")
                                .timezone("America/New_York")
                                .slackHandle("@raj.p")
                                .githubUsername("rajpatel")
                                .active(true)
                                .onCall(true)
                                .workingHoursStart(LocalTime.of(8, 0))
                                .workingHoursEnd(LocalTime.of(17, 0))
                                .categories(
                                                List.of(IncidentCategory.DATABASE, IncidentCategory.PERFORMANCE,
                                                                IncidentCategory.APPLICATION))
                                .build());

                SupportEngineer seYuki = supportEngineerRepository.save(SupportEngineer.builder()
                                .name("Yuki Tanaka")
                                .email("yuki@incidentnow.io")
                                .phone("+1-555-0202")
                                .timezone("America/Chicago")
                                .slackHandle("@yuki.t")
                                .githubUsername("yukitanaka")
                                .active(true)
                                .onCall(false)
                                .workingHoursStart(LocalTime.of(9, 0))
                                .workingHoursEnd(LocalTime.of(18, 0))
                                .categories(List.of(IncidentCategory.NETWORK, IncidentCategory.HARDWARE,
                                                IncidentCategory.CLOUD_INFRASTRUCTURE, IncidentCategory.DATABASE))
                                .build());

                SupportEngineer seFatima = supportEngineerRepository.save(SupportEngineer.builder()
                                .name("Fatima Hassan")
                                .email("fatima@incidentnow.io")
                                .phone("+1-555-0203")
                                .timezone("America/Los_Angeles")
                                .slackHandle("@fatima.h")
                                .githubUsername("fatimahassan")
                                .active(true)
                                .onCall(false)
                                .workingHoursStart(LocalTime.of(7, 0))
                                .workingHoursEnd(LocalTime.of(16, 0))
                                .categories(List.of(IncidentCategory.SECURITY, IncidentCategory.ACCESS_PERMISSIONS,
                                                IncidentCategory.NETWORK))
                                .build());

                SupportEngineer seLiam = supportEngineerRepository.save(SupportEngineer.builder()
                                .name("Liam O'Connor")
                                .email("liam@incidentnow.io")
                                .phone("+1-555-0204")
                                .timezone("America/Denver")
                                .slackHandle("@liam.o")
                                .githubUsername("liamoconnor")
                                .active(true)
                                .onCall(true)
                                .workingHoursStart(LocalTime.of(10, 0))
                                .workingHoursEnd(LocalTime.of(19, 0))
                                .categories(
                                                List.of(IncidentCategory.APPLICATION, IncidentCategory.SOFTWARE,
                                                                IncidentCategory.PERFORMANCE))
                                .build());

                // Create incidents
                Incident inc1 = incidentRepository.save(Incident.builder()
                                .incidentNumber("INC-2026-0001")
                                .title("Production database connection pool exhausted")
                                .description(
                                                "The main production database is running out of connection pool slots, causing intermittent 500 errors on the API.")
                                .status(IncidentStatus.IN_PROGRESS)
                                .priority(Priority.CRITICAL)
                                .severity(Severity.CRITICAL)
                                .category(IncidentCategory.DATABASE)
                                .tags(List.of("database", "production", "critical"))
                                .affectedSystems(List.of("API Gateway", "User Service", "Order Service"))
                                .affectedUsers(5000)
                                .owner(alice)
                                .assignees(new HashSet<>(Set.of(seRaj, seYuki)))
                                .workaround("Restart the connection pool every 30 minutes")
                                .githubRepo(GitHubRepo.builder()
                                                .repoOwner("incidentnow")
                                                .repoName("api-gateway")
                                                .branch("fix/connection-pool")
                                                .issueNumber(123)
                                                .build())
                                .acknowledgedAt(LocalDateTime.now().minusHours(2))
                                .timeToAcknowledge(15)
                                .build());

                Incident inc2 = incidentRepository.save(Incident.builder()
                                .incidentNumber("INC-2026-0002")
                                .title("SSL certificate expiring in 48 hours")
                                .description("The wildcard SSL certificate for *.incidentnow.io is expiring soon and needs renewal.")
                                .status(IncidentStatus.OPEN)
                                .priority(Priority.HIGH)
                                .severity(Severity.HIGH)
                                .category(IncidentCategory.SECURITY)
                                .tags(List.of("ssl", "certificates", "security"))
                                .affectedSystems(List.of("All public-facing services"))
                                .affectedUsers(10000)
                                .owner(carol)
                                .assignees(new HashSet<>(Set.of(seFatima)))
                                .dueDate(LocalDateTime.now().plusDays(2))
                                .build());

                Incident inc3 = incidentRepository.save(Incident.builder()
                                .incidentNumber("INC-2026-0003")
                                .title("Slow response times on search endpoint")
                                .description(
                                                "The /api/v1/search endpoint is responding with avg 5s latency instead of the usual 200ms.")
                                .status(IncidentStatus.RESOLVED)
                                .priority(Priority.MEDIUM)
                                .severity(Severity.MEDIUM)
                                .category(IncidentCategory.PERFORMANCE)
                                .tags(List.of("performance", "search", "latency"))
                                .affectedSystems(List.of("Search Service", "Elasticsearch"))
                                .affectedUsers(2000)
                                .owner(bob)
                                .assignees(new HashSet<>(Set.of(seLiam)))
                                .rootCause("Elasticsearch index not optimized after bulk data import")
                                .resolution(
                                                "Ran force-merge on the search index and updated the import pipeline to include optimization step")
                                .resolvedAt(LocalDateTime.now().minusDays(1))
                                .timeToResolve(480)
                                .build());

                Incident inc4 = incidentRepository.save(Incident.builder()
                                .incidentNumber("INC-2026-0004")
                                .title("Memory leak in notification service")
                                .description(
                                                "The notification service memory usage grows unbounded over 24h, eventually causing OOM kills.")
                                .status(IncidentStatus.ON_HOLD)
                                .priority(Priority.HIGH)
                                .severity(Severity.MEDIUM)
                                .category(IncidentCategory.APPLICATION)
                                .tags(List.of("memory-leak", "notifications"))
                                .affectedSystems(List.of("Notification Service"))
                                .affectedUsers(500)
                                .owner(alice)
                                .assignees(new HashSet<>(Set.of(seRaj)))
                                .workaround("Scheduled daily pod restart at 3 AM UTC")
                                .githubRepo(GitHubRepo.builder()
                                                .repoOwner("incidentnow")
                                                .repoName("notification-service")
                                                .branch("fix/memory-leak")
                                                .issueNumber(87)
                                                .pullRequestNumber(92)
                                                .build())
                                .build());

                // Create comments
                commentRepository.save(Comment.builder()
                                .incident(inc1)
                                .author(alice)
                                .content(
                                                "Identified the root cause - the connection pool max size was set to 10 but we need at least 50 for current load.")
                                .isInternal(false)
                                .build());

                commentRepository.save(Comment.builder()
                                .incident(inc1)
                                .author(bob)
                                .content("Increasing pool size to 50 in staging, will deploy to prod after testing.")
                                .isInternal(false)
                                .build());

                commentRepository.save(Comment.builder()
                                .incident(inc1)
                                .author(alice)
                                .content("Internal note: We should also review connection timeout settings.")
                                .isInternal(true)
                                .build());

                // Create timeline events
                timelineEventRepository.save(TimelineEvent.builder()
                                .incident(inc1)
                                .eventType(TimelineEventType.CREATED)
                                .description("Incident created: INC-2026-0001")
                                .actor(alice)
                                .timestamp(LocalDateTime.now().minusHours(3))
                                .build());

                timelineEventRepository.save(TimelineEvent.builder()
                                .incident(inc1)
                                .eventType(TimelineEventType.STATUS_CHANGED)
                                .description("Status changed")
                                .previousValue("open")
                                .newValue("in_progress")
                                .actor(alice)
                                .timestamp(LocalDateTime.now().minusHours(2))
                                .build());

                timelineEventRepository.save(TimelineEvent.builder()
                                .incident(inc1)
                                .eventType(TimelineEventType.ASSIGNED)
                                .description("Assigned to: Raj Patel, Yuki Tanaka")
                                .newValue("Raj Patel, Yuki Tanaka")
                                .actor(alice)
                                .timestamp(LocalDateTime.now().minusHours(2))
                                .build());

                log.info("Sample data loaded: {} owners, {} support engineers, {} incidents", ownerRepository.count(),
                                supportEngineerRepository.count(), incidentRepository.count());
        }
}
