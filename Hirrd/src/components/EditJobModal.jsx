import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import MDEditor from "@uiw/react-md-editor";

const EditJobModal = ({ job, onSave, onCancel, isOpen }) => {
    const [formData, setFormData] = useState({ ...job });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRequirementsChange = (value) => {
        setFormData({ ...formData, requirements: value || '' });
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        onSave(formData); // Pass the updated job back to the parent
    };

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Job</DialogTitle>
                    <DialogDescription>
                        Make changes to your job posting. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title || ''}
                            onChange={handleChange}
                            placeholder="Enter job title"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location || ''}
                            onChange={handleChange}
                            placeholder="Enter job location"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            placeholder="Enter job description"
                            className="min-h-[100px]"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="requirements">Requirements</Label>
                        <div data-color-mode="dark">
                            <MDEditor
                                value={formData.requirements || ''}
                                onChange={handleRequirementsChange}
                                preview="edit"
                                height={200}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditJobModal;
