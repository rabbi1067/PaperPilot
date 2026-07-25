package bd.paperpilot;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//database
@Entity
@Table(name = "papers")
//Constructor
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer  id;

    @NotBlank(message = "Paper title is required")
    @Column(name = "paper_title", nullable = false, length = 300)
    private String paperTitle;

    @NotBlank(message = "First author is required")
    @Column(name = "first_author", nullable = false, length = 150)
    private String firstAuthor;

    @Column(name = "conference_journal", length = 200)
    private String conferenceJournal;

    @NotNull(message = "Publication year is required")
    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "research_area", length = 100)
    private String researchArea;

    @Column(name = "dataset_used", length = 200)
    private String datasetUsed;

    @Column(name = "paper_url", length = 500)
    private String paperUrl;

    @Column(name = "research_gap", columnDefinition = "TEXT")
    private String researchGap;

    @Enumerated(EnumType.STRING)
    @Column(name = "reading_status", length = 20)
    private ReadingStatus readingStatus = ReadingStatus.NOT_STARTED;
}