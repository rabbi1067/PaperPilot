package bd.paperpilot;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Controller
@RequestMapping("/paper")
@RequiredArgsConstructor // for database
public class PageController {
    //database
    private final PaperInterface paperInterface;

    // Home
    @GetMapping("/home")
    public String home() {
        return "index";
    }

    //Add Paper form (next step)
    @GetMapping("/add")
    public String addPaperForm(Model model) {
        model.addAttribute("paper", new Paper());
        return "add-paper";
    }
    @PostMapping("/add")
    public String filePlan(@Valid @ModelAttribute Paper paper, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return "add-paper";
        }

        //save
        paperInterface.save(paper);
        log.info("Paper has been saved");


        return "redirect:/paper/add";
    }

    // Paper list

    @GetMapping("/list")
    public String paperList(Model model) {
        model.addAttribute("papers", paperInterface.findAll());
        return "paper-list";
    }
    // Delete confirmation
    @GetMapping("/delete/{id}")
    public String deleteConfirm(@PathVariable Integer id, Model model) {
        Paper paper = paperInterface.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found with id: " + id));
        model.addAttribute("paper", paper);
        return "paper-delete";
    }

    @PostMapping("/delete/{id}")
    public String deletePaper(@PathVariable Integer id) {
        paperInterface.deleteById(id);
        log.info("Paper with id {} has been deleted", id);
        return "redirect:/paper/list";
    }

    // Scene  Edit Paper form
    @GetMapping("/edit/{id}")
    public String editPaperForm(@PathVariable Integer  id, Model model) {
        Paper paper = paperInterface.findById(id)
                .orElseThrow(() -> new RuntimeException("Paper not found with id: " + id));
        model.addAttribute("paper", paper);
        model.addAttribute("isEdit", true);
        return "add-paper";
    }

    @PostMapping("/update/{id}")
    public String updatePaper(@PathVariable Integer  id, @Valid @ModelAttribute Paper paper,
                              BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("isEdit", true);
            return "add-paper";
        }
        paper.setId(id);
        paperInterface.save(paper);
        log.info("Paper with id {} has been updated", id);

        return "redirect:/paper/list";
    }

}