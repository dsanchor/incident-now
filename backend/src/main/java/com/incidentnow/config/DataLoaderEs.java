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
@ConditionalOnProperty(name = "app.data.language", havingValue = "es", matchIfMissing = true)
@RequiredArgsConstructor
public class DataLoaderEs implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoaderEs.class);

    private final OwnerRepository ownerRepository;
    private final SupportEngineerRepository supportEngineerRepository;
    private final IncidentRepository incidentRepository;
    private final CommentRepository commentRepository;
    private final TimelineEventRepository timelineEventRepository;

    @Override
    public void run(String... args) {
        if (ownerRepository.count() > 0) {
            log.info("Datos ya cargados, omitiendo...");
            return;
        }

        log.info("Cargando datos de ejemplo...");

        // Crear propietarios
        Owner ana = ownerRepository.save(Owner.builder()
                .name("Ana García")
                .email("ana@incidentnow.io")
                .phone("+34-600-100-101")
                .team("Ingeniería de Plataforma")
                .role(OwnerRole.SENIOR_ENGINEER)
                .department("Ingeniería")
                .timezone("Europe/Madrid")
                .slackHandle("@ana.g")
                .githubUsername("anagarcia")
                .active(true)
                .build());

        Owner carlos = ownerRepository.save(Owner.builder()
                .name("Carlos López")
                .email("carlos@incidentnow.io")
                .phone("+34-600-100-102")
                .team("Infraestructura")
                .role(OwnerRole.ENGINEER)
                .department("Ingeniería")
                .timezone("Europe/Madrid")
                .slackHandle("@carlos.l")
                .githubUsername("carloslopez")
                .active(true)
                .build());

        Owner marta = ownerRepository.save(Owner.builder()
                .name("Marta Fernández")
                .email("marta@incidentnow.io")
                .phone("+34-600-100-103")
                .team("Seguridad")
                .role(OwnerRole.TEAM_LEAD)
                .department("Seguridad")
                .timezone("Europe/Madrid")
                .slackHandle("@marta.f")
                .githubUsername("martafernandez")
                .active(true)
                .build());

        Owner diego = ownerRepository.save(Owner.builder()
                .name("Diego Martínez")
                .email("diego@incidentnow.io")
                .team("Ingeniería de Plataforma")
                .role(OwnerRole.MANAGER)
                .department("Ingeniería")
                .timezone("America/Mexico_City")
                .active(true)
                .build());

        // Crear ingenieros de soporte
        SupportEngineer sePablo = supportEngineerRepository.save(SupportEngineer.builder()
                .name("Pablo Ruiz")
                .email("pablo@incidentnow.io")
                .phone("+34-600-200-101")
                .timezone("Europe/Madrid")
                .slackHandle("@pablo.r")
                .githubUsername("pabloruiz")
                .active(true)
                .onCall(true)
                .workingHoursStart(LocalTime.of(8, 0))
                .workingHoursEnd(LocalTime.of(17, 0))
                .categories(
                        List.of(IncidentCategory.DATABASE, IncidentCategory.PERFORMANCE, IncidentCategory.APPLICATION))
                .build());

        SupportEngineer seElena = supportEngineerRepository.save(SupportEngineer.builder()
                .name("Elena Torres")
                .email("elena@incidentnow.io")
                .phone("+34-600-200-102")
                .timezone("Europe/Madrid")
                .slackHandle("@elena.t")
                .githubUsername("elenatorres")
                .active(true)
                .onCall(false)
                .workingHoursStart(LocalTime.of(9, 0))
                .workingHoursEnd(LocalTime.of(18, 0))
                .categories(List.of(IncidentCategory.NETWORK, IncidentCategory.HARDWARE,
                        IncidentCategory.CLOUD_INFRASTRUCTURE, IncidentCategory.DATABASE))
                .build());

        SupportEngineer seJavier = supportEngineerRepository.save(SupportEngineer.builder()
                .name("Javier Moreno")
                .email("javier@incidentnow.io")
                .phone("+34-600-200-103")
                .timezone("Europe/Madrid")
                .slackHandle("@javier.m")
                .githubUsername("javiermoreno")
                .active(true)
                .onCall(false)
                .workingHoursStart(LocalTime.of(7, 0))
                .workingHoursEnd(LocalTime.of(16, 0))
                .categories(List.of(IncidentCategory.SECURITY, IncidentCategory.ACCESS_PERMISSIONS,
                        IncidentCategory.NETWORK))
                .build());

        SupportEngineer seIsabel = supportEngineerRepository.save(SupportEngineer.builder()
                .name("Isabel Navarro")
                .email("isabel@incidentnow.io")
                .phone("+34-600-200-104")
                .timezone("Europe/Madrid")
                .slackHandle("@isabel.n")
                .githubUsername("isabelnavarro")
                .active(true)
                .onCall(true)
                .workingHoursStart(LocalTime.of(10, 0))
                .workingHoursEnd(LocalTime.of(19, 0))
                .categories(
                        List.of(IncidentCategory.APPLICATION, IncidentCategory.SOFTWARE, IncidentCategory.PERFORMANCE))
                .build());

        // Crear incidencias
        Incident inc1 = incidentRepository.save(Incident.builder()
                .incidentNumber("INC-2026-0001")
                .title("Pool de conexiones de base de datos en producción agotado")
                .description(
                        "La base de datos principal de producción se está quedando sin conexiones disponibles en el pool, causando errores 500 intermitentes en la API.")
                .status(IncidentStatus.IN_PROGRESS)
                .priority(Priority.CRITICAL)
                .severity(Severity.CRITICAL)
                .category(IncidentCategory.DATABASE)
                .tags(List.of("base-de-datos", "producción", "crítico"))
                .affectedSystems(List.of("API Gateway", "Servicio de Usuarios", "Servicio de Pedidos"))
                .affectedUsers(5000)
                .owner(ana)
                .assignees(new HashSet<>(Set.of(sePablo, seElena)))
                .workaround("Reiniciar el pool de conexiones cada 30 minutos")
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
                .title("Certificado SSL caduca en 48 horas")
                .description(
                        "El certificado SSL wildcard para *.incidentnow.io está a punto de caducar y necesita ser renovado.")
                .status(IncidentStatus.OPEN)
                .priority(Priority.HIGH)
                .severity(Severity.HIGH)
                .category(IncidentCategory.SECURITY)
                .tags(List.of("ssl", "certificados", "seguridad"))
                .affectedSystems(List.of("Todos los servicios públicos"))
                .affectedUsers(10000)
                .owner(marta)
                .assignees(new HashSet<>(Set.of(seJavier)))
                .dueDate(LocalDateTime.now().plusDays(2))
                .build());

        Incident inc3 = incidentRepository.save(Incident.builder()
                .incidentNumber("INC-2026-0003")
                .title("Tiempos de respuesta lentos en el endpoint de búsqueda")
                .description(
                        "El endpoint /api/v1/search está respondiendo con una latencia media de 5s en lugar de los 200ms habituales.")
                .status(IncidentStatus.RESOLVED)
                .priority(Priority.MEDIUM)
                .severity(Severity.MEDIUM)
                .category(IncidentCategory.PERFORMANCE)
                .tags(List.of("rendimiento", "búsqueda", "latencia"))
                .affectedSystems(List.of("Servicio de Búsqueda", "Elasticsearch"))
                .affectedUsers(2000)
                .owner(carlos)
                .assignees(new HashSet<>(Set.of(seIsabel)))
                .rootCause("Índice de Elasticsearch no optimizado después de una importación masiva de datos")
                .resolution(
                        "Se ejecutó force-merge en el índice de búsqueda y se actualizó el pipeline de importación para incluir el paso de optimización")
                .resolvedAt(LocalDateTime.now().minusDays(1))
                .timeToResolve(480)
                .build());

        Incident inc4 = incidentRepository.save(Incident.builder()
                .incidentNumber("INC-2026-0004")
                .title("Fuga de memoria en el servicio de notificaciones")
                .description(
                        "El uso de memoria del servicio de notificaciones crece sin límite en 24h, provocando finalmente errores OOM.")
                .status(IncidentStatus.ON_HOLD)
                .priority(Priority.HIGH)
                .severity(Severity.MEDIUM)
                .category(IncidentCategory.APPLICATION)
                .tags(List.of("fuga-de-memoria", "notificaciones"))
                .affectedSystems(List.of("Servicio de Notificaciones"))
                .affectedUsers(500)
                .owner(ana)
                .assignees(new HashSet<>(Set.of(sePablo)))
                .workaround("Reinicio programado diario del pod a las 3 AM UTC")
                .githubRepo(GitHubRepo.builder()
                        .repoOwner("incidentnow")
                        .repoName("notification-service")
                        .branch("fix/memory-leak")
                        .issueNumber(87)
                        .pullRequestNumber(92)
                        .build())
                .build());

        // Crear comentarios
        commentRepository.save(Comment.builder()
                .incident(inc1)
                .author(ana)
                .content(
                        "Se ha identificado la causa raíz: el tamaño máximo del pool de conexiones estaba configurado en 10, pero necesitamos al menos 50 para la carga actual.")
                .isInternal(false)
                .build());

        commentRepository.save(Comment.builder()
                .incident(inc1)
                .author(carlos)
                .content("Aumentando el tamaño del pool a 50 en staging, se desplegará en producción tras las pruebas.")
                .isInternal(false)
                .build());

        commentRepository.save(Comment.builder()
                .incident(inc1)
                .author(ana)
                .content("Nota interna: También deberíamos revisar la configuración de timeout de las conexiones.")
                .isInternal(true)
                .build());

        // Crear eventos de línea temporal
        timelineEventRepository.save(TimelineEvent.builder()
                .incident(inc1)
                .eventType(TimelineEventType.CREATED)
                .description("Incidencia creada: INC-2026-0001")
                .actor(ana)
                .timestamp(LocalDateTime.now().minusHours(3))
                .build());

        timelineEventRepository.save(TimelineEvent.builder()
                .incident(inc1)
                .eventType(TimelineEventType.STATUS_CHANGED)
                .description("Estado cambiado")
                .previousValue("open")
                .newValue("in_progress")
                .actor(ana)
                .timestamp(LocalDateTime.now().minusHours(2))
                .build());

        timelineEventRepository.save(TimelineEvent.builder()
                .incident(inc1)
                .eventType(TimelineEventType.ASSIGNED)
                .description("Asignado a: Pablo Ruiz, Elena Torres")
                .newValue("Pablo Ruiz, Elena Torres")
                .actor(ana)
                .timestamp(LocalDateTime.now().minusHours(2))
                .build());

        log.info("Datos de ejemplo cargados: {} propietarios, {} ingenieros de soporte, {} incidencias",
                ownerRepository.count(), supportEngineerRepository.count(), incidentRepository.count());
    }
}
