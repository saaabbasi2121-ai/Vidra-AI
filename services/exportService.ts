
export class ExportService {
  /**
   * Triggers a browser download for the generated project data.
   * This allows users to "test" the output in external tools or renderers.
   */
  static downloadProject(data: any, filename: string = 'faceless-project.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Formats a data URI for easy testing in local environments.
   */
  static async downloadBase64Image(base64: string, name: string) {
    const link = document.createElement('a');
    link.href = base64;
    link.download = `${name}.png`;
    link.click();
  }
}
