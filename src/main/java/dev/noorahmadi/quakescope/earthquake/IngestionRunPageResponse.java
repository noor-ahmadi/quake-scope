package dev.noorahmadi.quakescope.earthquake;

import java.util.List;

import org.springframework.data.domain.Page;

record IngestionRunPageResponse(
        List<IngestionRunResponse> content,
        PageMetadata page) {

    static IngestionRunPageResponse from(Page<IngestionRun> runs) {
        return new IngestionRunPageResponse(
                runs.getContent().stream().map(IngestionRunResponse::from).toList(),
                PageMetadata.from(runs));
    }
}
