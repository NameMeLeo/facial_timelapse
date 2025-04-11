import align
import timelapse
import gradio as gr

if __name__ == "__main__":
    with gr.Blocks(css="footer {visibility: hidden}", title="Timelapse") as iface:
        with gr.Tab("Align Image"):
            image_box = gr.Image(type="filepath", label="Upload Image")
            process_button = gr.Button("Process")
            process_button.click(fn=align.process_image, inputs=image_box, outputs=image_box)
        
        with gr.Tab("Generate Timelapse"):
            duration_slider = gr.Slider(
                minimum=1, 
                maximum=100,
                step=1, 
                value=5, 
                label="Duration (seconds)"
            )
            generate_button = gr.Button("Generate Timelapse")
            gif_output = gr.Image(label="Timelapse GIF", type="filepath")
            generate_button.click(
                fn=timelapse.create_timelapse, 
                inputs=duration_slider, 
                outputs=gif_output
            )
    
    iface.launch(server_name="0.0.0.0", server_port=7860, favicon_path="icon.jpg")