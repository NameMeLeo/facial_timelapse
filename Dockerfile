# Use the official Python image from the Docker Hub
FROM ultralytics/ultralytics:latest-cpu

# Set the working directory in the container
WORKDIR /app

RUN pip install gradio face_alignment imageio

VOLUME /app

# Expose the port for the Gradio app
EXPOSE 7860

# Command to run the Gradio app
# CMD ["python", "download.py"]
CMD ["python", "app.py"]